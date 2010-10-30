import SBIRS_GEO1.v1_0_0
import SBIRS_GEO1.v1_0_0.sim_messages as sim_messages
import SBIRS_GEO1.v1_0_0.sim_models as sim_models
import calypso.tlm
import calypso.tlm.view

SBIRS_GEO1.v1_0_0.create_models()

class Formats:
    pass

class TlmViews:
    pass



def create_default_formats():
    for key,instnc in sim_models.model_set.iteritems():
        format=calypso.tlm.Format( instnc.name+"_Mdl_Fmt")
        for monitor in dir(instnc):
            if monitor.endswith("_IO"):
                monname=monitor.replace("_IO","")
                data_io=instnc.__dict__[monitor]
                newmonitor=calypso.tlm.Monitor(data_io.name) 
                newmonitor.data_io=data_io
                newmonitor.fields=data_io.Struct._fields_
                format.monitors.append(newmonitor)
        Formats.__dict__[instnc.name+"_Mdl_Fmt"]=format
                    
def create_default_views( ):
    MAX_MONS=20
    create_default_formats()
    for format in dir(Formats):
        if format.endswith("_Fmt"):
            display=calypso.tlm.view.TelemetryDisplay(format+"_View",calypso.tlm.Format.formats[format])
            window=calypso.tlm.view.TelemetryWindow(format+"_View")
            display.append_tab(window)
            window.tiles=[[]]
            y_pos=0
            x_pos=0
            table=calypso.tlm.view.Tile(format,'table')
            properties = calypso.tlm.view.DisplayProperties(id=format, pos_x=x_pos, pos_y=y_pos)
            for monitor in Formats.__dict__[format].monitors:
                table.monitors.append(monitor)
                if len(table.monitors) > MAX_MONS:
                    window.place_tile(table,properties)
                    x_pos=x_pos+1
                    y_pos=0
                    table=calypso.tlm.view.Tile(format,'table')
                    properties = calypso.tlm.view.DisplayProperties(id=format, pos_x=0, pos_y=y_pos)
            window.place_tile(table, properties)
            TlmViews.__dict__[format+"_View"]=display

        
                
#create_default_views()
