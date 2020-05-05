namespace Regulator_Oswietlenia
{
    class Program
    {
        static void Main(string[] args)
        {
            Regulator regulator = new Regulator(100, 5);
            regulator.StartRegulator();
            regulator.CloseRegulator(); 
        }


    }
}
