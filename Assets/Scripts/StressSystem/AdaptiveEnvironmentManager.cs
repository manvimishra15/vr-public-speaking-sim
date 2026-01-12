using UnityEngine;

public class AdaptiveEnvironmentManager : MonoBehaviour
{
    [Header("Audience Groups (4 levels)")]
    public GameObject group_1;  // smallest
    public GameObject group_2;
    public GameObject group_3;
    public GameObject group_4;  // biggest

    [Header("Lights")]
    public Light directionalLight;
    public Light stageSpotLight;

    [Header("Ambience")]
    public AudioSource crowdAmbience;

    [Header("Stress Thresholds (0-100)")]
    public float group1Stress = 20f;
    public float group2Stress = 40f;
    public float group3Stress = 60f;
    public float group4Stress = 80f;

    private int currentLevel = -1;

    void Start()
    {
        ApplyLevel(0); // empty hall at start
    }

    void Update()
    {
        if (StressManager.Instance == null) return;

        float stress = StressManager.Instance.stress;

        // ✅ FIX: Use correct function
        int targetLevel = GetLevelFromStress(stress);

        if (targetLevel != currentLevel)
            ApplyLevel(targetLevel);

        UpdateLightingAndSound(stress);
    }

    // ✅ stress HIGH => fewer people
    int GetLevelFromStress(float stress)
    {
        // level 4 = biggest crowd
        // level 1 = smallest crowd

        if (stress >= group4Stress) return 1; // high stress => smallest
        if (stress >= group3Stress) return 2;
        if (stress >= group2Stress) return 3;
        return 4; // low stress => biggest
    }

    void ApplyLevel(int level)
    {
        currentLevel = level;

        // Turn OFF all groups
        if (group_1) group_1.SetActive(false);
        if (group_2) group_2.SetActive(false);
        if (group_3) group_3.SetActive(false);
        if (group_4) group_4.SetActive(false);

        // Enable only one group
        switch (level)
        {
            case 1: if (group_1) group_1.SetActive(true); break;
            case 2: if (group_2) group_2.SetActive(true); break;
            case 3: if (group_3) group_3.SetActive(true); break;
            case 4: if (group_4) group_4.SetActive(true); break;
            // 0 = empty hall (all OFF)
        }

        Debug.Log("✅ Audience Level = " + level);
    }

    void UpdateLightingAndSound(float stress)
{
    float t = stress / 100f;

    if (directionalLight)
        directionalLight.intensity = Mathf.Lerp(1.2f, 0.5f, t);

    if (stageSpotLight)
        stageSpotLight.intensity = Mathf.Lerp(0.8f, 2.4f, t);

    // ✅ optional: high stress -> more silent crowd
    if (crowdAmbience)
    {
        // stress ↑ => crowd quieter
        crowdAmbience.volume = Mathf.Lerp(0.4f, 0.0f, t);
    }
}

}
