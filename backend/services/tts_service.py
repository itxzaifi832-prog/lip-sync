import asyncio
from gtts import gTTS
from utils.file_handler import get_temp_file_path

class TTSService:
    @staticmethod
    def _generate_audio_gtts(text: str, lang: str = 'en') -> str:
        tts = gTTS(text=text, lang=lang, slow=False)
        # Save as mp3 as gTTS produces mp3
        output_path = get_temp_file_path(".mp3")
        tts.save(str(output_path))
        return str(output_path)

    @staticmethod
    async def generate_audio(text: str, lang: str = 'en') -> str:
        """
        Generates audio from text using gTTS.
        Returns the path to the generated audio file.
        """
        loop = asyncio.get_event_loop()
        # gTTS makes network requests, run in executor
        return await loop.run_in_executor(None, TTSService._generate_audio_gtts, text, lang)
