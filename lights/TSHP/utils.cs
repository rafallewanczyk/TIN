using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public static class utils
    {
        public static void Log(string message, int status)
        {
            switch (status)
            {
                case -1:
                    Console.ForegroundColor = ConsoleColor.Red;
                    break;

                case 0:
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    break;

                case 1:
                    Console.ForegroundColor = ConsoleColor.Green;
                    break;

                default:
                    Console.ForegroundColor = ConsoleColor.White;
                    break;
            }

            Console.WriteLine(message); 
            Console.ForegroundColor = ConsoleColor.Yellow;
        }
    }
}
