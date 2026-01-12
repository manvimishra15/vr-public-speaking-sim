using UnityEngine;

public class VoiceStressMonitor : MonoBehaviour
{
    [Header("Mic Settings")]
    public string microphoneDevice;
    public int sampleRate = 44100;
    public int sampleLengthSec = 1;

    private AudioClip micClip;
    private float[] samples = new float[256];

    [Header("Pause + Fumble Detection")]
    public float pauseTimeThreshold = 1.2f;
    public float longPauseThreshold = 2.5f;

    [Header("Speech Detection")]
    public float loudnessThreshold = 0.008f;
    public float varianceThreshold = 0.0012f;

    private float silenceTimer = 0f;
    private float smoothLoudness = 0f;

    // pause pattern memory
    private float fumbleWindow = 8f;
    private float fumbleTimer = 0f;
    private int pauseEvents = 0;

    private bool pauseTriggered = false;
    private bool longPauseTriggered = false;

    // smooth anxiety output
    private float anxiety01 = 0f;        // 0..1
    public float anxietySmoothSpeed = 5f;

    [Header("Calm Speech Detection (tuned)")]
    public float calmAnxietyThreshold = 0.30f;  // ✅ relaxed (was 0.22)
    public float calmRequiredSeconds = 1.5f;    // ✅ must be calm for 1.5 sec
    private float calmTimer = 0f;

    [Header("Speech Speed Proxy (ZCR)")]
    public float zcrNormalMin = 0.045f;
    public float zcrNormalMax = 0.11f;
    public float zcrExtreme = 0.20f;

    [Header("Stress Weights")]
    public float stressGain = 10f;
    public float pauseStressWeight = 0.55f;
    public float speedStressWeight = 0.75f;
    public float tremorStressWeight = 0.35f;
    public float freezeStressWeight = 0.60f;

    [Header("Calm Relief (visible in demo)")]
    public float calmReliefPerSec = 3.0f;       // ✅ stronger so it drops visibly
    public float maxCalmRelief = 6.0f;          // ✅ cap relief
    public float pauseDecayPerSec = 0.45f;      // ✅ NEW: pauses fade gradually

    void Start()
    {
        StartMicrophone();
    }

    void Update()
    {
        if (StressManager.Instance == null || micClip == null) return;

        // Loudness + smoothing
        float loudness = GetMicLoudness();
        smoothLoudness = Mathf.Lerp(smoothLoudness, loudness, 6f * Time.deltaTime);
        StressManager.Instance.micLoudness = smoothLoudness;

        // Speaking detection
        float variance = GetEnergyVariance();
        bool isSpeaking = (smoothLoudness > loudnessThreshold) && (variance > varianceThreshold);
        bool isSilent = !isSpeaking;

        // metrics
        UpdateVoiceMetrics(isSpeaking, smoothLoudness);

        // ✅ NEW: pauseEvents decay over time (allows calm quickly)
        fumbleTimer += Time.deltaTime;
        if (pauseEvents > 0)
        {
            float decay = pauseDecayPerSec * Time.deltaTime;
            // fractional decay trick
            if (Random.value < decay) pauseEvents = Mathf.Max(0, pauseEvents - 1);
        }

        // Hard reset window still exists (backup)
        if (fumbleTimer >= fumbleWindow)
        {
            pauseEvents = Mathf.Max(0, pauseEvents - 1);  // ✅ not full reset, gentle fade
            fumbleTimer = 0f;
        }

        // ---- compute factors ----
        float speedScore = 0f;
        float pauseScore = 0f;
        float freezeScore = 0f;
        float tremorScore = StressManager.Instance.tremorScore;

        // speed score from ZCR
        if (isSpeaking)
        {
            float zcr = GetZeroCrossingRate();
            if (zcr < zcrNormalMin)
                speedScore = Mathf.InverseLerp(zcrNormalMin, 0f, zcr);
            else if (zcr > zcrNormalMax)
                speedScore = Mathf.InverseLerp(zcrNormalMax, zcrExtreme, zcr);
            else
                speedScore = 0f;

            speedScore = Mathf.Clamp01(speedScore);
        }

        // pause / freeze
        if (isSilent)
        {
            silenceTimer += Time.deltaTime;

            if (!pauseTriggered && silenceTimer >= pauseTimeThreshold)
            {
                pauseTriggered = true;
                StressManager.Instance.pauseCount += 1;
                pauseEvents++;
            }

            if (!longPauseTriggered && silenceTimer >= longPauseThreshold)
            {
                longPauseTriggered = true;
            }

            pauseScore = Mathf.Clamp01(pauseEvents / 3f);

            if (silenceTimer > 1.5f)
                freezeScore = Mathf.InverseLerp(1.5f, 5f, silenceTimer);
            freezeScore = Mathf.Clamp01(freezeScore);
        }
        else
        {
            silenceTimer = 0f;
            pauseTriggered = false;
            longPauseTriggered = false;

            pauseScore = Mathf.Clamp01(pauseEvents / 3f);
            freezeScore = 0f;
        }

        // ---- Final anxiety ----
        float rawAnxiety =
            (speedScore * speedStressWeight) +
            (pauseScore * pauseStressWeight) +
            (tremorScore * tremorStressWeight) +
            (freezeScore * freezeStressWeight);

        // spike rules
        if (pauseEvents >= 3 && speedScore > 0.25f)
            rawAnxiety += 0.35f;

        if (isSpeaking)
        {
            float zcrNow = GetZeroCrossingRate();
            if (zcrNow > 0.14f && pauseEvents == 0)
                rawAnxiety += 0.25f;
        }

        rawAnxiety = Mathf.Clamp01(rawAnxiety);

        // smooth anxiety output
        anxiety01 = Mathf.Lerp(anxiety01, rawAnxiety, Time.deltaTime * anxietySmoothSpeed);

        // store debug-like values
        StressManager.Instance.speechSpeed = Mathf.Lerp(StressManager.Instance.speechSpeed, speedScore, 0.6f);

        // ✅ calm check (RELAXED thresholds)
        bool calmCandidate =
            isSpeaking &&
            anxiety01 < calmAnxietyThreshold &&
            pauseEvents <= 1 &&
            tremorScore < 0.35f;   // ✅ relaxed (was 0.22)

        // must remain calm for X seconds
        if (calmCandidate) calmTimer += Time.deltaTime;
        else calmTimer = 0f;

        bool calmSpeaking = calmTimer >= calmRequiredSeconds;

        // ---- Apply stress ----
        float stressDelta = (anxiety01 * stressGain) * Time.deltaTime;

        if (calmSpeaking)
        {
            // relief proportional to how calm you are
            // (lower anxiety -> more relief)
            float calmStrength = Mathf.InverseLerp(calmAnxietyThreshold, 0f, anxiety01);
            float relief = Mathf.Clamp(calmReliefPerSec * calmStrength, 0f, maxCalmRelief);
            StressManager.Instance.AddStress(-relief * Time.deltaTime);
        }
        else
        {
            StressManager.Instance.AddStress(stressDelta);
        }
    }

    // Tremor + breathing
    void UpdateVoiceMetrics(bool isSpeaking, float loudness)
    {
        float tremor = 0f;
        for (int i = 1; i < samples.Length; i++)
            tremor += Mathf.Abs(samples[i] - samples[i - 1]);

        tremor /= samples.Length;
        StressManager.Instance.tremorScore = Mathf.Clamp01(tremor * 14f);

        float breathing = 0f;
        if (!isSpeaking && loudness > 0.002f && loudness < loudnessThreshold)
            breathing = 1f;

        StressManager.Instance.breathingScore = Mathf.Lerp(
            StressManager.Instance.breathingScore,
            breathing,
            4f * Time.deltaTime
        );
    }

    float GetEnergyVariance()
    {
        float mean = 0f;
        for (int i = 0; i < samples.Length; i++)
            mean += Mathf.Abs(samples[i]);
        mean /= samples.Length;

        float var = 0f;
        for (int i = 0; i < samples.Length; i++)
        {
            float diff = Mathf.Abs(samples[i]) - mean;
            var += diff * diff;
        }

        var /= samples.Length;
        return var;
    }

    float GetZeroCrossingRate()
    {
        int crossings = 0;
        for (int i = 1; i < samples.Length; i++)
        {
            float a = samples[i - 1];
            float b = samples[i];
            if ((a >= 0f && b < 0f) || (a < 0f && b >= 0f))
                crossings++;
        }
        return (float)crossings / samples.Length;
    }

    void StartMicrophone()
    {
        if (Microphone.devices.Length == 0)
        {
            Debug.LogWarning("No microphone detected.");
            return;
        }

        microphoneDevice = Microphone.devices[0];
        micClip = Microphone.Start(microphoneDevice, true, sampleLengthSec, sampleRate);
        Debug.Log("Mic started: " + microphoneDevice);
    }

    float GetMicLoudness()
    {
        int micPos = Microphone.GetPosition(microphoneDevice) - samples.Length;
        if (micPos < 0) return 0;

        micClip.GetData(samples, micPos);

        float sum = 0f;
        for (int i = 0; i < samples.Length; i++)
            sum += Mathf.Abs(samples[i]);

        return sum / samples.Length;
    }
}
