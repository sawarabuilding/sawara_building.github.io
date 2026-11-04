from pathlib import PurePosixPath
MEDIA_FOLDERS = {"sawaraban-01":"03_archives/01_freepaper/01_sawaraban-01/images","sawaraban-02":"03_archives/01_freepaper/02_sawaraban-02/images","zine-nagata-2026":"03_archives/03_exhibition/01_zine-nagata-2026/images","zine-seishin-2026":"03_archives/03_exhibition/02_zine-seishin-2026/images","magazine-1":"03_archives/05_magazine/01_magazine-01/images"}
def media_path(relative):
    value = str(relative)
    for prefix in ('assets/archives/', '90_shared/archives/'):
        if value.startswith(prefix):
            tail = value[len(prefix):]
            folder, _, name = tail.partition('/')
            if folder in MEDIA_FOLDERS:
                return MEDIA_FOLDERS[folder] + '/' + name
    return value
