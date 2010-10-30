from calypso.tests import *

class TestTilepropertiesController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='TileProperties', action='index'))
        # Test response...
