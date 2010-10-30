from calypso.tests import *

class TestTutorialController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='tutorial', action='index'))
        # Test response...
