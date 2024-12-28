import logging
from typing import Dict, Optional

from fastapi import Query
from fastapi_pagination import Params
from postmarker.core import PostmarkClient
from pydantic_extra_types.phone_numbers import PhoneNumber as PydanticPhoneNumber
from sendgrid import SendGridAPIClient
from starlette import status

from config import Config


class CustomExceptionError(Exception):
    """Custom Exception class with status, status_code and message."""

    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        message: str = 'Internal Server Error',
        headers: Optional[Dict[str, str]] = None,
    ):
        """Initialize method for custom exception class."""
        self.status_code = status_code
        self.message = message
        self.headers = headers


def sendgrid_client() -> SendGridAPIClient:
    """
    Get the SendGrid client with the data residency set to Europe.

    :return: SendGrid client
    :rtype: SendGridAPIClient
    """
    if Config.SENDGRID_API_KEY is None:
        logging.error('SendGrid API key is not set')
        raise ValueError('SendGrid API key is not set')
    logging.debug('SendGrid client created')
    logging.debug('SendGrid API key: %s', Config.SENDGRID_API_KEY)
    return SendGridAPIClient(Config.SENDGRID_API_KEY)


def postmark_client() -> PostmarkClient:
    """
    Get the Postmark client.

    :return: Postmark client
    :rtype: PostmarkClient
    """
    if Config.POSTMARK_API_KEY is None:
        logging.error('Postmark API key is not set')
        raise ValueError('Postmark API key is not set')
    logging.debug('Postmark client created')
    logging.debug('Postmark API key: %s', Config.POSTMARK_API_KEY)
    return PostmarkClient(server_token=Config.POSTMARK_API_KEY)


def _send_email_sendgrid(to: str, subject: str, html_content: str, from_email: str = Config.FROM_EMAIL) -> bool:
    """
    Send email using SendGrid.

    :param to: Email address of the recipient
    :type to: str
    :param subject: Subject of the email
    :type subject: str
    :param html_content: HTML content of the email
    :type html_content: str
    :param from_email: Email address of the sender
    :type from_email: str

    :return: True if the email was sent successfully, False otherwise
    :rtype: bool
    """
    client = sendgrid_client()
    message = {
        'personalizations': [{'to': [{'email': to}]}],
        'from': {'email': from_email},
        'subject': subject,
        'content': [{'type': 'text/html', 'value': html_content}],
    }
    try:
        response = client.send(message)
        logging.debug('Email sent successfully: %s', response)
        return True
    except Exception as e:
        logging.error('Error sending email: %s', e)
        return False


def _send_email_postmark(to: str, subject: str, html_content: str, from_email: str = Config.FROM_EMAIL) -> bool:
    """
    Send email using Postmark.

    :param to: Email address of the recipient
    :type to: str
    :param subject: Subject of the email
    :type subject: str
    :param html_content: HTML content of the email
    :type html_content: str
    :param from_email: Email address of the sender
    :type from_email: str

    :return: True if the email was sent successfully, False otherwise
    :rtype: bool
    """
    client = postmark_client()
    try:
        response = client.emails.send(
            From=from_email,
            To=to,
            Subject=subject,
            HtmlBody=html_content,
        )
        logging.debug('Email sent successfully: %s', response)
        return True
    except Exception as e:
        logging.error('Error sending email: %s', e)
        return False


def send_email(to: str, subject: str, html_content: str, from_email: str = Config.FROM_EMAIL) -> bool:
    """Send email using SendGrid or Postmark"""
    if Config.SENDGRID_API_KEY:
        logging.debug('Sending email using SendGrid')
        return _send_email_sendgrid(to=to, subject=subject, html_content=html_content, from_email=from_email)
    if Config.POSTMARK_API_KEY:
        logging.debug('Sending email using Postmark')
        return _send_email_postmark(to=to, subject=subject, html_content=html_content, from_email=from_email)
    logging.error('No email service provider configured, please set either SendGrid or Postmark API key')
    return False


def get_portal_url(path: str = '') -> str:
    """
    Get the portal URL based on the server environment

    :param path: Path to be appended to the portal URL
    :type path: str

    :return: The portal URL for the specified environment.
    :rtype: str
    """
    return f'{Config.PORTAL_URL}{path}'


def get_avatar_url(name: str) -> str:
    """
    Get the URL for the avatar based on the name provided.

    :param name: Name to be used for the avatar
    :type name: str

    :return: The URL for the avatar
    :rtype: str
    """
    name = name.replace(' ', '+')  # Url encode the name
    return f'https://ui-avatars.com/api/?name={name}?background=random'


class CustomParams(Params):
    """Override Params for custom default size"""

    size: int = Query(10, ge=1, le=100, description='Page size')


class PhoneNumber(PydanticPhoneNumber):
    """Phone number model"""

    phone_format = 'E164'
