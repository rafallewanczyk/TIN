using System;

namespace light_regulator
{
    class Program
    {
        static void Main(string[] args)
        {
            LampRegulator regulator = new LampRegulator(5000, 5, 1);
            regulator.StartRegulator();
            regulator.CloseRegulator();
        }
    }
}
