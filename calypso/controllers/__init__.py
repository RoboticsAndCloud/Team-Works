
import calypso.lib.base
import calypso.lib.helpers

    
class BaseController(calypso.lib.base.BaseController):
    
 
    class Action:


        def __init__(self, action, linkname, *args, **kargs):
            self.name = action
            self.linkname = linkname
            self.params = dict()
            for index in kargs:
                self.params[index] = kargs[index]

        def url_for(self, controller):
            calypso.lib.helpers.url_for( controller = controller,
                                         action = self.name,
                                         params = self.params)
                
    class ActionList:

        def __init__(self,name):
            self.name = name
            self.actions=[]
            
        def add_action(self, action, linkname, *args, **kargs):
            self.actions.append(BaseController.Action(action,linkname,*args, **kargs))

    class TaskCategory:

        def __init__(self, title, image):
            self.title = title
            self.image = image
            self.actionlists = []
            self.actiondict = {}
            
        def add_actionlist(self, list):
            self.actionlists.append( list )
            self.actiondict[list.name] = list
            return list
            
            
    user = None
    requires_auth=True

        
    def __before__(self):
        # Authentication required?
        if self.requires_auth and 'user' not in session:
            # Remember where we came from so that the user can be sent there
            # after a successful login
            session['path_before_login'] = request.path_info+"?"
            for key, value in request.params.iteritems():
                session['path_before_login']+= (key +"=" + value + "&")
            session.save()
            return redirect_to(h.url_for(controller='login'))

    def add_task(self, title, image):
        task = BaseController.TaskCategory(title, image)
        self.tasks.append( task)
        self.taskdict[title] = task
        return task

    def __init__(self):
        self.tasks = []
        self.taskdict = {}

        
