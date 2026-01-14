using UnityEngine;

public class UltravoxTrigger : MonoBehaviour
{
    public UltravoxBotClient ultravox;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.B))
        {
            ultravox.StartCall("Hi, I am feeling stressed. Calm me down.");
        }
    }
}
