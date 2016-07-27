import cherrypy
import os


class Root:
    def __init__(self):
        pass

    @cherrypy.expose()
    def old(self):
        return load_html('index.html')

    @cherrypy.expose(['index'])
    def new(self, **params):
        html = load_html('index.html')
        #html = html.replace('js/demo_old.js', 'js/demo_new.js')
        return html


def load_html(file_name):
    lines = open(os.path.join(MEDIA_DIR, file_name), "r").readlines()
    return "".join(lines)


MEDIA_DIR = os.path.join(os.path.abspath("."))
QUICKSTART_CONFIG = {
    "/": {
        "tools.staticdir.root": MEDIA_DIR,
        "tools.etags.on": True,
        "tools.etags.autotags": True,
        "tools.gzip.on": True
    },
    "/css": {
        "tools.staticdir.on": True,
        "tools.staticdir.dir": "css"
    },
    "/js": {
        "tools.staticdir.on": True,
        "tools.staticdir.dir": "js"
    },
    "/data": {
        "tools.staticdir.on": True,
        "tools.staticdir.dir": "data"
    },
}

if __name__ == "__main__":
    cherrypy.config.update({
        "server.socket_host": "0.0.0.0",
        "server.socket_port": 8000,
    })
    cherrypy.quickstart(Root(), "", config=QUICKSTART_CONFIG)


