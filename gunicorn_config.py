# Gunicorn Configuration for UCO Presence MVC Core API
bind = "0.0.0.0:35553"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 60
keepalive = 2
accesslog = "-"
errorlog = "-"
loglevel = "info"
proc_name = "uco_gunicorn_35553"
