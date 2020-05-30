using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public class CurrentData : DeviceSetting
    {
        public int id;
        public bool state;

        public CurrentData(int id, bool state)
        {
            this.id = id;
            this.state = state;
        }
    }
}
