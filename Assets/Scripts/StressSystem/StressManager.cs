using UnityEngine;
using System;

public class StressManager : MonoBehaviour
{
    public static StressManager Instance;

    [Header("Stress (0-100)")]
    [Range(0, 100)] public float stress = 20f;

    [Header("Live Metrics (for UI)")]
    public float micLoudness;
    public float speechSpeed;     // 0..1 proxy
    public int pauseCount;
    public float tremorScore;     // 0..1 proxy
    public float breathingScore;  // 0..1 proxy

    public event Action<float> OnStressChanged;

    [Header("Keyboard Test Controls (optional)")]
    public bool enableKeyboardTest = false;
    public float keyboardStep = 2f;

    [Header("Debug")]
    public bool debugLogs = false;

    void Awake()
    {
        // singleton (only 1 StressManager across scenes)
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    void Update()
    {
        // ✅ Optional keyboard testing (for demo)
        if (!enableKeyboardTest) return;

        if (Input.GetKeyDown(KeyCode.K))
        {
            AddStress(+keyboardStep);
            if (debugLogs) Debug.Log("K pressed -> stress = " + stress);
        }

        if (Input.GetKeyDown(KeyCode.L))
        {
            AddStress(-keyboardStep);
            if (debugLogs) Debug.Log("L pressed -> stress = " + stress);
        }
    }

    public void AddStress(float delta)
    {
        float prev = stress;
        stress = Mathf.Clamp(stress + delta, 0, 100);

        // fire event only when change is meaningful
        if (Mathf.Abs(prev - stress) > 0.01f)
            OnStressChanged?.Invoke(stress);
    }

    public float Stress01()
    {
        return stress / 100f;
    }
}
