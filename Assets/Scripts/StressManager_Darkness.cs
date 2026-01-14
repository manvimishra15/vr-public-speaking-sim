using UnityEngine;

public class StressManager_Darkness : MonoBehaviour
{
    public static StressManager_Darkness Instance;

    [Header("Stress (0-100)")]
    [Range(0f, 100f)]
    public float stress = 20f;

    public float minStress = 0f;
    public float maxStress = 100f;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    public void AddStress(float amount)
    {
        stress = Mathf.Clamp(stress + amount, minStress, maxStress);
    }

    public float GetStress01()
    {
        return Mathf.InverseLerp(minStress, maxStress, stress);
    }
}
