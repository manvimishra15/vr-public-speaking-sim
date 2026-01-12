using UnityEngine;
using UnityEngine.UI;

public class PanicManager : MonoBehaviour
{
    [Header("Panic Settings")]
    [Range(0, 100)] public float panic = 0;
    public float panicDecreaseRate = 6f;

    // This is set by zones
    public float zoneIncreaseRate = 0f;

    [Header("UI (Optional)")]
    public Slider panicSlider;

    void Update()
    {
        // Panic increases in zone, decreases outside
        if (zoneIncreaseRate > 0)
            panic += zoneIncreaseRate * Time.deltaTime;
        else
            panic -= panicDecreaseRate * Time.deltaTime;

        panic = Mathf.Clamp(panic, 0, 100);

        if (panicSlider)
            panicSlider.value = panic / 100f;
    }

    public void SetZoneRate(float rate)
    {
        zoneIncreaseRate = rate;
    }
}
