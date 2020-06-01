using System;
using System.ComponentModel;
using System.Text;

namespace light_device
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Podaj port: ");
            int port = Int32.Parse(Console.ReadLine());
            LampDevice lamp = new LampDevice(port);
            lamp.StartConnection();
            lamp.StartSending();
            lamp.Close();




        }

       
    }
}
