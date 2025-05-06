## Gems API

API to get lyrics : https://api.some-random-api.com/lyrics?title=manusia%20kuat

Example response:

```
{
  "title": "Manusia Kuat",
  "artist": "Tulus",
  "lyrics": "Kau bisa patahkan kakiku\nTapi tidak mimpi-mimpiku\nKau bisa lumpuhkan tanganku\nTapi tidak mimpi-mimpiku\n\nKau bisa merebut senyumku\nTapi sungguh tak akan lama\nKau bisa merobek hatiku\nTapi aku tahu obatnya\n\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\nManusia-manusia kuat Itu kita\nJiwa-jiwa yang kuat itu kita\n\nKau bisa hitamkan putihku\nKau takkan gelapkan apapun\nKau bisa runtuhkan jalanku\nKan ku temukan jalan yang lain\n\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\n\nBila bukan kehendak-Nya uhuuuu\nTidak satu pun culasmu akan bawa bahaya\n\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\n\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\nManusia-manusia kuat itu kita\nJiwa-jiwa yang kuat itu kita\n\nKau bisa patahkan kakiku\nPatah tangan rebut senyumku\nHitamkan putihnya hatiku\nTapi tidak mimpi-mimpiku",
  "url": "https://www.lyricsfreak.com/t/tulus/manusia+kuat_21608193.html",
  "thumbnail": "https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/d1/8f/41/d18f41cf-45e4-39f4-4d10-0a0af01f7eb7/cover.jpg/600x600bb.jpg"
}
```
Note: It's seems that selalu ada di nadimu is not there yet

LyricsGenius is another option:
- https://genius.com/
- https://pypi.org/project/lyricsgenius/

export GENIUS_ACCESS_TOKEN="shU6DraV3Yl9AwdLhG36vCwUoYTbsSV0V3qWyy3keapRqWJ87CsPeZY2XcUeZGEf"
python -m lyricsgenius song "Manusia Kuat"

