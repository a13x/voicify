import tornado.ioloop
import tornado.web
import tornado.options
import logging
import urllib
import functools
from twilio.rest import TwilioRestClient
import twilio.twiml

TWACCT = ""
TWTOKEN = ""

URL = "http://your_server/voice_url?{0}"
MSG = "Hey {0}, Alex wanted to let you know that he's listening to {1} and you should listen to it, too!"
PHONENR = "+1234567890"

class Main(tornado.web.RequestHandler):
	"""
		main entry point to the app
	"""
	def post(self):
		"""
			Posting the name of the song, which calls my users and says smth like:
			Hey, Alex wanted to let you know that he's listening to "name of the song" sung by "artist"
		"""
		song = self.get_argument("song")		
		name = self.get_argument("name")
		number = self.get_argument("number")
		tornado.ioloop.IOLoop.instance().add_callback(functools.partial(self._push_to_call, number, name, song))		

	def get(self):
		"""
			Accepts the song name and returns TwiML to say things
		"""
		resp = twilio.twiml.Response()
		song = self.get_argument("song")
		name = self.get_argument("name")
		resp.say(MSG.format(name, song), voice="woman")
		resp.hangup()
		logging.debug(str(resp))
		self.set_header("Content-Type", "text/xml")
		self.write(str(resp))
	
	def _push_to_call(self, number, name, song):
		"""
			makes a call in next IOLoop
		"""
		url = URL.format(urllib.urlencode(dict(song=song, name=name)))
		self.application.tw.calls.create(to=number, from_=PHONENR, url=url, method="GET")

app = tornado.web.Application([
	(r"/tw/voice", Main),
])

tw = TwilioRestClient(TWACCT, TWTOKEN)
app.tw = tw

if __name__ == '__main__':
	tornado.options.parse_command_line()
	app.listen(8000)
	tornado.ioloop.IOLoop.instance().start()