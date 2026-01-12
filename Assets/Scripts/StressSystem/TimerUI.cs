using UnityEngine;
using TMPro;

public class TimerUI : MonoBehaviour
{
    [Header("UI Text")]
    public TMP_Text timerText;

    private float elapsedTime = 0f;
    private bool running = true;

    void Update()
    {
        if (!running) return;

        elapsedTime += Time.deltaTime;

        int minutes = Mathf.FloorToInt(elapsedTime / 60f);
        int seconds = Mathf.FloorToInt(elapsedTime % 60f);

if (StressManager.Instance != null && StressManager.Instance.stress >= 100f)
    running = false;

        if (timerText != null)
            timerText.text = $"{minutes:00}:{seconds:00}";
    }

    // ✅ optional controls
    public void ResetTimer()
    {
        elapsedTime = 0f;
    }

    public void StartTimer()
    {
        running = true;
    }

    public void StopTimer()
    {
        running = false;
    }
}
