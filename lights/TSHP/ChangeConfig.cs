using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public class ChangeConfig : DeviceSetting
    {
        private int id, port;
        private int status;

        public ChangeConfig(int id, int port, int status)
        {
            this.id = id;
            this.port = port;
            this.status = status;
        }

        public int Id { get => id; set => id = value; }
        public int Port { get => port; set => port = value; }
        public int Status { get => status; set => status = value; }

        public override string ToString()
        {
            return this.GetType().Name + " " + id.ToString() + " " + port.ToString() + " " + status.ToString(); 
        }
    }
}
