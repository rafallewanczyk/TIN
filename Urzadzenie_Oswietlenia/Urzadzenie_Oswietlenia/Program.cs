namespace Lamp_Device{
    class Program
    {

        static void Main(string[] args)
        {
            Lamp lamp = new Lamp(5000);
            lamp.StartConnection();
            lamp.StartSending();
            lamp.Close();
        }

    }
}
