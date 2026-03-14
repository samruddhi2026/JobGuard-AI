from sqlalchemy import create_engine, text

def test_passwords():
    passwords = ["", "admin", "postgres", "password", "root", "123456"]
    for p in passwords:
        uri = f"postgresql://postgres:{p}@localhost/postgres"
        print(f"Testing password: '{p}' on 'postgres' db")
        try:
            engine = create_engine(uri, connect_args={'connect_timeout': 2})
            with engine.connect() as conn:
                print(f"!!! SUCCESS with password: '{p}'")
                return p
        except Exception as e:
            if "authentication failed" in str(e):
                print("Auth failed")
            else:
                print(f"Other error: {e}")
    return None

if __name__ == "__main__":
    test_passwords()
