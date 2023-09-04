```mermaid
sequenceDiagram
    Caller ->>+ API: FormReference
    API ->>+ Modal Form: FormReference
    Modal Form ->> Modal Form: Display form
    Modal Form ->> API: On submit
    API ->> Caller: On submit
```
