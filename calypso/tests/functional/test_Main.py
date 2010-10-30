from calypso.tests import *

class TestMainController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='Main', action='index'))
        # Test response...
