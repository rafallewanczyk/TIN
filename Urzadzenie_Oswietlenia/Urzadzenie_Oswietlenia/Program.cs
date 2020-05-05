namespace Urzadzenie_Oswietlenia
{
    class Program
    {

        static void Main(string[] args)
        {
            Lamp lamp = new Lamp(100);
            lamp.StartConnection();
            lamp.StartSending();
            lamp.Close();
        }

    }
}
