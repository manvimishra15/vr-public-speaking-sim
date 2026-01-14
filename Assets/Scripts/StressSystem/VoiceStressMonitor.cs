using UnityEngine;

public class VoiceStressMonitor : MonoBehaviour
{
[Header("Mic Settings")]
public string microphoneDevice;
public int sampleRate = 44100;
public int sampleLengthSec = 1;

private AudioClip micClip;
private float[] samples = new float[256];

[Header("Pause Detection")]
public float loudnessThreshold = 0.01f; // silence limit
public float pauseTimeThreshold = 1.2f; // seconds of silence to count as pause
private float silenceTimer = 0f;

void Start()
{
StartMicrophone();
}

void Update()
{
if (StressManager.Instance == null || micClip == null) return;

float loudness = GetMicLoudness();
StressManager.Instance.micLoudness = loudness;

// ✅ Pause detection
if (loudness < loudnessThreshold)
{
silenceTimer += Time.deltaTime;

if (silenceTimer >= pauseTimeThreshold)
{
StressManager.Instance.pauseCount += 1;
StressManager.Instance.AddStress(4f); // stress spike on long pause

silenceTimer = 0f;
}
}
else
{
silenceTimer = 0f;
StressManager.Instance.AddStress(-1.5f * Time.deltaTime); // speaking reduces stress slightly
}
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
