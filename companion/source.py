"""Build a draw pool from a YouTube video's comment count, an IMAP mailbox, or a list."""
import imaplib,os,json,re
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlencode
INTERVAL=60
def snapshot(o,m):
    mode=o["mode"];entries=[]
    if mode=="youtube":
        q=urlencode(dict(part="statistics",id=o["video"],key=os.environ["YOUTUBE_KEY"]))
        with urlopen("https://www.googleapis.com/youtube/v3/videos?"+q,timeout=8) as r:data=json.load(r)
        n=int(data["items"][0]["statistics"]["commentCount"])
    elif mode=="imap":
        with imaplib.IMAP4_SSL(o["host"],timeout=10) as client:
            client.login(o["username"],os.environ["IMAP_PASSWORD"])
            status,data=client.status('"'+o.get("mailbox","INBOX").replace('"','')+'"',"(MESSAGES)")
            if status!="OK":raise ValueError("Mailbox unavailable")
            n=int(re.search(rb"MESSAGES (\d+)",data[0]).group(1))
    elif mode=="list":
        entries=[s.strip() for s in Path(o["file"]).read_text().splitlines() if s.strip()]
        if len(entries)>150 or any(len(s)>40 for s in entries):raise ValueError("Use up to 150 names of 40 characters")
        n=len(entries)
    else:raise ValueError("Choose youtube, imap or list")
    if not 1<=n<=9999999:raise ValueError("Draw pool must contain 1 to 9999999 items")
    return dict(maximum=n,entries=entries,pages=[dict(caption="POOL",value=str(n),lines=[mode])])
