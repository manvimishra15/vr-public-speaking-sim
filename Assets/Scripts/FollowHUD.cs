using UnityEngine;
using TMPro;

public class FollowHUD : MonoBehaviour
{
    [Header("Sources")]
    public StressDetectorVR stressDetector;
    public RoomSwitcher roomSwitcher;

    [Header("UI Texts")]
    public TMP_Text timerText;
    public TMP_Text stressText;
    public TMP_Text roomText;
    public TMP_Text aiText;

    [Header("Thresholds")]
    public float safeMax = 30f;
    public float alertMax = 60f;
    public float panicMin = 75f;

    float sessionTime;
    float msgTimer;
    int lastRoomIndex = -1;

    void Start()
    {
        roomText.text = "";
        aiText.text = "AI: You’re safe. Inhale… Exhale…";
    }

    void Update()
    {
        // TIMER
        sessionTime += Time.deltaTime;
        timerText.text = "Time: " + FormatTime(sessionTime);

        // STRESS
        float s = stressDetector != null ? stressDetector.stress : 0f;
        UpdateStressUI(s);

        // ROOM CHANGE MSG
        if (roomSwitcher != null)
        {
            int current = roomSwitcher.GetCurrentRoomIndex();
            if (lastRoomIndex != -1 && current != lastRoomIndex)
            {
                // if index got smaller => bigger room (relief)
                if (current < lastRoomIndex)
                    ShowRoomMsg("✅ Relax… Expanding room (making it easier)");
                else
                    ShowRoomMsg("⬇ Increasing challenge… Room getting smaller");

                lastRoomIndex = current;
            }
            else if (lastRoomIndex == -1)
            {
                lastRoomIndex = current;
            }
        }

        // hide message after time
        if (msgTimer > 0)
        {
            msgTimer -= Time.deltaTime;
            if (msgTimer <= 0) roomText.text = "";
        }
    }

    void UpdateStressUI(float s)
    {
        if (s < safeMax)
        {
            stressText.text = $"Stress: {Mathf.RoundToInt(s)}% (SAFE)";
            stressText.color = Color.green;
            aiText.text = "AI: Good. Keep breathing slowly.";
        }
        else if (s < alertMax)
        {
            stressText.text = $"Stress: {Mathf.RoundToInt(s)}% (ALERT)";
            stressText.color = Color.yellow;
            aiText.text = "AI: You’re tense. Inhale 4… hold… exhale 6…";
        }
        else if (s < panicMin)
        {
            stressText.text = $"Stress: {Mathf.RoundToInt(s)}% (STRESSED)";
            stressText.color = new Color(1f, 0.55f, 0f);
            aiText.text = "AI: Focus ahead. Slow down your movement.";
        }
        else
        {
            stressText.text = $"Stress: {Mathf.RoundToInt(s)}% (PANIC)";
            stressText.color = Color.red;
            aiText.text = "AI: Panic detected. Relax— I’m making it easier.";
        }
    }

    void ShowRoomMsg(string msg)
    {
        roomText.text = msg;
        roomText.color = Color.white;
        msgTimer = 3f;
    }

    string FormatTime(float t)
    {
        int min = Mathf.FloorToInt(t / 60f);
        int sec = Mathf.FloorToInt(t % 60f);
        return min.ToString("00") + ":" + sec.ToString("00");
    }
}
