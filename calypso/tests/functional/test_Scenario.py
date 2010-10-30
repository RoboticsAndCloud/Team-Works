from calypso.tests import *

class TestScenarioController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='Scenario', action='index'))
        # Test response...
