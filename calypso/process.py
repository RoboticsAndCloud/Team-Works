import os;
import signal;
import time
class Process:

    def __init__(self, script, *args):
        self.pid=os.spawnl(os.P_NOWAIT,"/usr/bin/python","python",script,*args)
 
    def wait():
        status=os.waitpid(self.pid,0)

    def terminate():
        os.kill(self.pid,signal.SIGTREM)
        time.sleep(0.25)
        os.kill(self.pid,signal.SIGKILL)

        
