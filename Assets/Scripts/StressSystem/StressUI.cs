using UnityEngine;
using TMPro;  // TextMeshPro

public class StressUI : MonoBehaviour
{
    [Header("Assign UI Text")]
    public TextMeshProUGUI stressText;

    void Update()
    {
        if (StressManager.Instance == null || stressText == null) return;

        float stress = StressManager.Instance.stress;

        stressText.text = $"STRESS: {stress:0}%";
    }
}
