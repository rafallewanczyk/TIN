namespace Lamp_Regulator
{
    class Program
    {
        static void Main(string[] args)
        {
            Regulator regulator = new Regulator(5000, 5);
            regulator.StartRegulator();
            regulator.CloseRegulator(); 
        }


    }
}
