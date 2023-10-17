# Hierarchy:

                GameObject
                /        \
               /          \
              /            \
             /              \
     GameObjectImage   GridObject
                        /      \
                       /        \
                      /          \
                     /            \
        GridObjectStatic        GridObjectDynamic
                |
                |
                |
                |
     GridObjectStaticImage


# Conventions:
## Never Override Events
Events are intended for subclasses and for behavior that differs from the BaseClasses.
Instead of overriding event functions like OnRemove, override Remove directly and call super.Remove.
