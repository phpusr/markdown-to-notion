create table public.imported_notes
(
    id         serial
        constraint imported_notes_pk
            primary key,
    title      varchar               not null,
    "filePath" varchar               not null,
    imported   boolean               not null,
    error      json,
    "noteId"   uuid                  not null,
    skip       boolean default false not null
);
