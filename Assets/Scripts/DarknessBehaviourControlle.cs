using UnityEngine;

public class DarknessBehaviourController_Fixed : MonoBehaviour
{
    [Header("REFERENCES (Must Assign)")]
    public Light mainRoomLight;         // Directional light
    public Light safeLampLight;         // Point light (optional)
    public Transform xrOrigin;          // XR Origin
    public Transform head;              // Main Camera
    public Transform safeLamp;          // Safe lamp transform (optional)

    [Header("LIGHT CONTROL")]
    [Range(0f, 1f)] public float darkness = 0.4f;   // 0 bright, 1 dark
    public float maxIntensity = 1.2f;
    public float minIntensity = 0.02f;
    public float intensityLerpSpeed = 6f;

    [Header("SAFE ZONE (optional)")]
    public float safeZoneRadius = 4f;

    [Header("BEHAVIOUR DETECTION")]
    public float freezeSpeedThreshold = 0.03f; // slower than this = freeze
    public float freezeTimeToTrigger = 1.5f;

    public float calmSpeedThreshold = 0.08f;   // faster than this = calm movement
    public float headScanYawThreshold = 75f;   // degrees/sec

    [Header("DARKEN/BRIGHTEN SPEED")]
    public float darkenRate = 0.20f;    // calm => darker
    public float brightenRate = 0.35f;  // panic => brighter

    [Header("DEBUG")]
    public bool debugLogs = true;

    // runtime trackers
    private Vector3 lastBodyPos;
    private float freezeTimer;

    private float lastYaw;

    void Start()
    {
        if (xrOrigin != null) lastBodyPos = xrOrigin.position;
        if (head != null) lastYaw = head.eulerAngles.y;
    }

    void Update()
    {
        if (mainRoomLight == null || xrOrigin == null || head == null) return;

        // ------------------- 1) BODY SPEED (VERY IMPORTANT FIX) -------------------
        // XR Origin sometimes doesn't move much because of playspace locomotion.
        // We'll still compute it, but more tolerant.
        Vector3 bodyPos = xrOrigin.position;
        float bodySpeed = Vector3.Distance(bodyPos, lastBodyPos) / Mathf.Max(Time.deltaTime, 0.0001f);
        lastBodyPos = bodyPos;

        // ------------------- 2) HEAD PANIC SCAN -------------------
        float yaw = head.eulerAngles.y;
        float deltaYaw = Mathf.DeltaAngle(lastYaw, yaw);
        lastYaw = yaw;

        float yawSpeed = Mathf.Abs(deltaYaw) / Mathf.Max(Time.deltaTime, 0.0001f);
        bool panicScan = yawSpeed > headScanYawThreshold;

        // ------------------- 3) FREEZE DETECTION -------------------
        if (bodySpeed < freezeSpeedThreshold)
            freezeTimer += Time.deltaTime;
        else
            freezeTimer = Mathf.Max(0f, freezeTimer - Time.deltaTime * 2f);

        bool freezing = freezeTimer >= freezeTimeToTrigger;

        // ------------------- 4) SAFE LAMP HUGGING (optional) -------------------
        bool huggingLamp = false;
        if (safeLamp != null)
        {
            float dist = Vector3.Distance(xrOrigin.position, safeLamp.position);
            huggingLamp = dist <= safeZoneRadius;
        }

        // ------------------- 5) DECISION -------------------
        bool stressed = freezing || panicScan || huggingLamp;
        bool calmMove = (!stressed && bodySpeed > calmSpeedThreshold && yawSpeed < 55f);

        // ------------------- 6) APPLY DARKNESS -------------------
        // stressed => brighter (darkness decreases)
        // calm => darker (darkness increases)
        if (stressed)
        {
            darkness -= brightenRate * Time.deltaTime;
        }
        else if (calmMove)
        {
            darkness += darkenRate * Time.deltaTime;
        }
        else
        {
            // neutral: very slow increase darkness
            darkness += (darkenRate * 0.05f) * Time.deltaTime;
        }

        darkness = Mathf.Clamp01(darkness);

        // convert darkness to intensity
        float targetIntensity = Mathf.Lerp(maxIntensity, minIntensity, darkness);
        mainRoomLight.intensity = Mathf.Lerp(mainRoomLight.intensity, targetIntensity, intensityLerpSpeed * Time.deltaTime);

        if (safeLampLight != null)
            safeLampLight.intensity = 3.5f;

        // ------------------- 7) DEBUG LOGS -------------------
        if (debugLogs && Time.frameCount % 30 == 0)
        {
            Debug.Log(
                $"[DarknessCtrl] speed={bodySpeed:F3}, yawSpeed={yawSpeed:F1}, freezeT={freezeTimer:F2}, " +
                $"freezing={freezing}, panicScan={panicScan}, lamp={huggingLamp}, stressed={stressed}, calm={calmMove}, darkness={darkness:F2}"
            );
        }
    }
}
