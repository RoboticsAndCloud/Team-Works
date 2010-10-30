import formencode
import formencode.compound

class UniqueProject(formencode.validators.FancyValidator):
    projects={}
    
    def validate_python(self, value, state):     
        print UniqueProject.projects   
        if UniqueProject.projects.has_key(value):
            raise formencode.validators.Invalid('Project name already exists', value, state)

class ExistingProject(formencode.validators.FancyValidator):
     
    def validate_python(self, value, state):     
        UniqueWorkbook.project_name=value
        if not UniqueProject.projects.has_key(value):
            raise formencode.validators.Invalid('Project name does not exists', value, state)

class UniqueWorkbook(formencode.validators.FancyValidator):
    workbooks={}
    project_name=None;
    
    def validate_python(self, value, state):     
       if UniqueWorkbook.workbooks.has_key(UniqueWorkbook.project_name + "." + value):
            raise formencode.validators.Invalid('Project and workbook name already exists', value, state)
            

class ProjectForm(formencode.Schema):
    allow_extra_fields=False
    project_name = formencode.compound.All( formencode.validators.NotEmpty(), #non-empty
                                            UniqueProject())#project name unique
    project_type= formencode.validators.NotEmpty()
    contract_id = formencode.validators.NotEmpty()
    Submit= formencode.validators.Bool() #always true, but here to recognize submit field

class WorkbookForm(formencode.Schema):
    allow_extra_fields=False
    workbook_project_name = formencode.compound.All( ExistingProject(),
                                             formencode.validators.NotEmpty())
    workbook_name = formencode.compound.All( formencode.validators.NotEmpty(), #non-empty
                                             UniqueWorkbook())#project name unique
    Submit= formencode.validators.Bool() #always true, but here to recognize submit field
    