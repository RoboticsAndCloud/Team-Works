from calypso.tests import *

class TestVisualizationController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='Visualization', action='index'))
        # Test response...
