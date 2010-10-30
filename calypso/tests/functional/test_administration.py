from calypso.tests import *

class TestAdministrationController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='administration', action='index'))
        # Test response...
