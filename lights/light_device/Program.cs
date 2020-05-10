using System;
using System.Text;

namespace light_device
{
    class Program
    {
        static void Main(string[] args)
        {
            LampDevice lamp = new LampDevice(5000);
            lamp.StartConnection();
            lamp.StartSending();
            lamp.Close();
        }

       
    }
}
