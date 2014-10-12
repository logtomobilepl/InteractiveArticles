from django.core.mail import EmailMessage

def send_mail(topic, content, to_who):
	email = EmailMessage(topic, content, to=[to_who])
	email.send()