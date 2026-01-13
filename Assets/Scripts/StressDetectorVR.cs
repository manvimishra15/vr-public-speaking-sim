using UnityEngine;

public class StressDetectorVR : MonoBehaviour
{
    [Header("Assign XR Transforms")]
    public Transform xrOrigin;     // XR Origin
    public Transform head;         // Main Camera

    [Header("Stress Output")]
    [Range(0, 100)] public float stress = 0f;

    [Header("Tuning")]
    public float speedThreshold = 1.0f;        // m/s (walking)
    public float headShakeThreshold = 90f;     // degrees/sec

    public float stressIncreaseRate = 25f;     // per sec
    public float stressDecreaseRate = 10f;     // per sec (slower)

    [Header("WASD Panic Boost (Simulator)")]
    public bool enableWASDBoost = true;

    // taps per second above this => panic
    public float tapPanicThreshold = 4f;

    // how much extra stress per sec when tapping fast
    public float tapBoostMax = 35f;

    // very small stress per sec while holding keys (optional)
    public float holdStressPerSecond = 5f;

    // decay speed of tap panic
    public float tapDecayPerSecond = 3f;

    Vector3 lastPos;
    Quaternion lastHeadRot;

    // tap tracking
    float tapScore = 0f;  // increases on taps, decays over time

    void Start()
    {
        lastPos = xrOrigin.position;
        lastHeadRot = head.rotation;
    }

    void Update()
    {
        // ===============================
        // 1) Movement speed (VR - original)
        // ===============================
        float speed = Vector3.Distance(xrOrigin.position, lastPos) / Mathf.Max(Time.deltaTime, 0.0001f);
        lastPos = xrOrigin.position;

        float moveFactor = Mathf.Clamp01(speed / speedThreshold); // 0..1

        // ===============================
        // 2) Head shake speed (KEEP SAME)
        // ===============================
        float angle = Quaternion.Angle(head.rotation, lastHeadRot);
        float headAngVel = angle / Mathf.Max(Time.deltaTime, 0.0001f); // deg/sec
        lastHeadRot = head.rotation;

        float headFactor = Mathf.Clamp01(headAngVel / headShakeThreshold); // 0..1

        // ===============================
        // 3) Combine (original)
        // ===============================
        float raw = (0.6f * moveFactor) + (0.4f * headFactor); // 0..1
        float target = raw * 100f;

        // Rise fast, fall slow (original)
        if (target > stress)
            stress = Mathf.MoveTowards(stress, target, stressIncreaseRate * Time.deltaTime);
        else
            stress = Mathf.MoveTowards(stress, target, stressDecreaseRate * Time.deltaTime);

        // ===============================
        // 4) WASD Panic Boost (Simulator)
        // ===============================
        if (enableWASDBoost)
        {
            HandleWASD();
        }

        // clamp
        stress = Mathf.Clamp(stress, 0f, 100f);
    }

    void HandleWASD()
    {
        // Count rapid taps (KeyDown is tap)
        bool tapped =
            Input.GetKeyDown(KeyCode.W) ||
            Input.GetKeyDown(KeyCode.A) ||
            Input.GetKeyDown(KeyCode.S) ||
            Input.GetKeyDown(KeyCode.D);

        if (tapped)
        {
            // each tap adds score (panic indicator)
            tapScore += 1.0f;
        }

        // decay tap score over time (so it doesn't stay forever)
        tapScore = Mathf.MoveTowards(tapScore, 0f, tapDecayPerSecond * Time.deltaTime);

        // Convert tapScore into "taps per second" feeling
        // (because decay makes it behave like a recent-taps meter)
        float approxTapRate = tapScore; // behaves like rolling rate

        // If user is tapping fast -> add panic boost
        if (approxTapRate >= tapPanicThreshold)
        {
            // scale boost smoothly
            float boost01 = Mathf.InverseLerp(tapPanicThreshold, tapPanicThreshold + 6f, approxTapRate);
            float boost = boost01 * tapBoostMax;

            stress += boost * Time.deltaTime;
        }

        // Optional: holding keys gives mild stress (continuous struggle)
        bool holding =
            Input.GetKey(KeyCode.W) ||
            Input.GetKey(KeyCode.A) ||
            Input.GetKey(KeyCode.S) ||
            Input.GetKey(KeyCode.D);

        if (holding)
        {
            stress += holdStressPerSecond * Time.deltaTime;
        }
    }
}
