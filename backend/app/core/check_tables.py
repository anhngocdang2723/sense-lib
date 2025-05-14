from sqlalchemy import text, inspect
from app.core.database import engine, Base
from app.models import *  # Import all models to ensure they are registered

def check_tables():
    """Check if all tables were created successfully."""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Get all model tables
    model_tables = []
    for model in Base.__subclasses__():
        if hasattr(model, '__tablename__'):
            model_tables.append(model.__tablename__)
    
    # Check which tables exist and which don't
    missing_tables = set(model_tables) - set(existing_tables)
    created_tables = set(model_tables) & set(existing_tables)
    
    print("\n=== Database Tables Status ===")
    print(f"\nTotal tables in models: {len(model_tables)}")
    print(f"Tables created: {len(created_tables)}")
    print(f"Tables missing: {len(missing_tables)}")
    
    if created_tables:
        print("\nCreated tables:")
        for table in sorted(created_tables):
            print(f"- {table}")
    
    if missing_tables:
        print("\nMissing tables:")
        for table in sorted(missing_tables):
            print(f"- {table}")
    
    # Check enum types
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT t.typname as enum_name, e.enumlabel as enum_value
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            ORDER BY t.typname, e.enumsortorder;
        """))
        enum_types = {}
        for row in result:
            if row.enum_name not in enum_types:
                enum_types[row.enum_name] = []
            enum_types[row.enum_name].append(row.enum_value)
    
    print("\n=== Enum Types Status ===")
    print(f"\nTotal enum types created: {len(enum_types)}")
    
    if enum_types:
        print("\nCreated enum types:")
        for enum_name, values in sorted(enum_types.items()):
            print(f"- {enum_name}: {', '.join(values)}")

if __name__ == "__main__":
    check_tables() 