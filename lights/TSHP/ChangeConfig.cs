using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public class ChangeConfig : DeviceSetting
    {
        private int id, port;
        private string hostname;
        private byte[] key;
        private bool targetData;

        public int Id { get => id; set => id = value; }
        public int Port { get => port; set => port = value; }
        public string Hostname { get => hostname; set => hostname = value; }
        public byte[] Key { get => key; set => key = value; }
        public bool TargetData { get => targetData; set => targetData = value; }

        public ChangeConfig(int id, int port, string hostname,  byte[] key, bool targetData)
        {
            this.id = id;
            this.port = port;
            this.hostname = hostname;
            this.key = key;
            this.targetData = targetData;
        }

        public override string ToString()
        {
            return this.GetType().Name + " " + Id.ToString() + " " + Port.ToString() + " " + TargetData.ToString();
        }
    }
}
