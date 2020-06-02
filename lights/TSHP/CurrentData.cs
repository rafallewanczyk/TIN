using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public class CurrentData : DeviceSetting
    {
        public int id;
        public short state;

        public CurrentData(int id, short state)
        {
            this.id = id;
            this.state = state;
        }

        public override string ToString()
        {
            return $"id: {id}, status: {state}"; 
        }
    }
}
