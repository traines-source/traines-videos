FROM tburrows13/moviepy

RUN apt-get install libcairo2

ADD ./res/high/RobotoCondensed-Bold.ttf /usr/share/fonts/truetype/RobotoCondensed-Bold.ttf

RUN fc-cache -f && pip install gizeh
