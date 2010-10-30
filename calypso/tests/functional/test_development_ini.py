from calypso.tests import *

class TestIniController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='development/ini', action='index'))
        # Test response...
