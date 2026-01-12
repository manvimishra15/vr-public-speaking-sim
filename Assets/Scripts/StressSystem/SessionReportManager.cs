using UnityEngine;
using TMPro;

public class SessionReportManager : MonoBehaviour
{
    [Header("Panels")]
    public GameObject panelUI;               // VRCanvas/Panel_UI
    public GameObject sessionReportPanel;    // VRCanvas/SessionReportPanel

    [Header("Report Texts")]
    public TMP_Text avgStressText;
    public TMP_Text maxStressText;
    public TMP_Text totalPausesText;
    public TMP_Text voiceSteadinessText;

    private float totalStressSum = 0f;
    private float maxStress = 0f;
    private float sessionTime = 0f;
    private bool isSessionRunning = true;

    void Start()
    {
        if (sessionReportPanel != null) sessionReportPanel.SetActive(false);
    }

    void Update()
    {
        if (!isSessionRunning) return;
        if (StressManager.Instance == null) return;

        sessionTime += Time.deltaTime;

        float stress = StressManager.Instance.stress;
        totalStressSum += stress * Time.deltaTime;

        if (stress > maxStress) maxStress = stress;
    }

    public void EndSession()
    {
        Debug.Log("🔥 END SESSION CLICKED");

        isSessionRunning = false;

        // ✅ force show report panel
        if (panelUI != null) panelUI.SetActive(false);

        if (sessionReportPanel == null)
        {
            Debug.LogError("❌ sessionReportPanel not assigned!");
            return;
        }

        sessionReportPanel.SetActive(true);
        Debug.Log("✅ sessionReportPanel ENABLED");

        if (StressManager.Instance == null)
        {
            Debug.LogError("❌ StressManager.Instance NULL");
            return;
        }

        float avgStress = (sessionTime > 0f) ? (totalStressSum / sessionTime) : StressManager.Instance.stress;
        int pauses = StressManager.Instance.pauseCount;

        float steadiness = 100f - (StressManager.Instance.tremorScore * 100f);
        steadiness = Mathf.Clamp(steadiness, 0f, 100f);

        // ✅ update texts only if assigned
        if (avgStressText != null) avgStressText.text = "Avg Stress: " + avgStress.ToString("0") + "%";
        if (maxStressText != null) maxStressText.text = "Max Stress: " + maxStress.ToString("0") + "%";
        if (totalPausesText != null) totalPausesText.text = "Total Pauses: " + pauses;
        if (voiceSteadinessText != null) voiceSteadinessText.text = "Voice Steadiness: " + steadiness.ToString("0") + "%";

        Debug.Log("✅ Report filled + shown");
    }
}
