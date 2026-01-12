using UnityEngine;
using TMPro;

public class AICoachUI : MonoBehaviour
{
    public TMP_Text coachText;

    private float messageTimer = 0f;
    private string lastMessage = "";

    void Update()
    {
        if (StressManager.Instance == null || coachText == null) return;

        messageTimer += Time.deltaTime;

        // update message every 2 seconds (so it doesn't flicker)
        if (messageTimer < 2f) return;
        messageTimer = 0f;

        var sm = StressManager.Instance;

        string msg = GetMessage(sm);

        // only update if changed
        if (msg != lastMessage)
        {
            coachText.text = "Coach: " + msg;
            lastMessage = msg;
        }
    }

    string GetMessage(StressManager sm)
    {
        float stress = sm.stress;
        float speed = sm.speechSpeed;
        float tremor = sm.tremorScore;
        int pauses = sm.pauseCount;

        // ✅ HIGH stress advice
        if (stress >= 75)
        {
            if (pauses >= 3) return "You’re pausing too much. Speak slowly and keep flow.";
            return "Take a deep breath. You’re safe. Continue calmly.";
        }

        // ✅ tremor based
        if (tremor > 0.6f)
            return "Hands/voice trembling detected. Breathe in… breathe out.";

        // ✅ speed based
        if (speed < 0.25f)
            return "Try speaking a bit more continuously.";

        if (speed > 0.85f)
            return "You are speaking too fast. Slow down slightly.";

        // ✅ normal encouragement
        if (stress < 35)
            return "Great pace! Confidence level is good 💪";

        return "Good job! Maintain eye contact & keep going.";
    }
}
