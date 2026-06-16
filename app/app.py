from app.app_factory import create_app

app = create_app()
application = app  # For WSGI servers

if __name__ == "__main__":
    app.run(debug=True)