"""Original JavaScript (ew) version written by @BreadTeleporter on 10th October 2023
Rewritten in Python by @mldkyt on 29th January 2024
"""

import json
import random
import subprocess
import codecs
import discord
from discord.ext import commands as discord_commands

with open('config.json', 'r', encoding='utf8') as f:
    config = json.load(f)

if 'BOT_TOKEN' not in config:
    print('ERROR: Bot token not found in config.json')
    exit(1)

client = discord.Bot()

async def log_to_logs(message: str):
    """Log to logs, this is cool and epic"""
    channel = client.get_channel(config['LOGS_CHNNL'])
    if channel is None:
        return
    await channel.send(message)

@client.slash_command(name="ping", description="fuck off")
async def ping(ctx: discord.Interaction):
    await ctx.response.send_message("fuck off")

@client.slash_command(name="rr", description="bruh idk")
@discord_commands.bot_has_permissions(manage_roles=True)
@discord_commands.guild_only()
async def rr(ctx: discord.Interaction):
    rand = random.randint(1, 6)
    if rand == 4:
        await ctx.response.send_message('*BANG*')
        role = ctx.guild.get_role(config['RR_LOSSROLE'])
        await ctx.user.add_roles(role)
        return

    await ctx.response.send_message('*click*')

@client.slash_command(name="avatar", description="Get avatar of an user")
async def avatar(ctx: discord.Interaction, user: discord.User):
    if not user.avatar:
        await ctx.response.send_message('User doesn\'t have an avatar')
        return

    await ctx.response.send_message(user.avatar.url)

@client.slash_command(name="hex", description="Convert text to hex")
async def hex(ctx: discord.Interaction, text: str):
    converted = text.encode(encoding='hex')
    await ctx.response.send_message(converted)

@client.slash_command(name="run", description="OWNER ONLY: Run a command on the host machine (is very safe)")
async def run(ctx: discord.Interaction, text: str):
    await ctx.response.defer()
    
    if ctx.user.id != config['OWNER_ID']:
        await ctx.response.send_message('You are not allowed to use this command')
        return

    program = subprocess.run(text, shell=True, capture_output=True)
    if program.returncode != 0:
        await ctx.followup.send(content=f'ERROR: {program.stderr.decode("utf8")}')
        return
    
    await ctx.followup.send(content=program.stdout.decode('utf8'))


@client.event
async def on_ready():
    print(f'Ready! Logged in as {client.user}')
    log_to_logs(f'{client.user} is in your walls (bot started)')


@client.event
async def on_interaction_error(ctx: discord.Interaction, error: Exception):
    if isinstance(error, discord_commands.NoPrivateMessage):
        await ctx.response.send_message('This command cannot be used in DMs')
        return

    if isinstance(error, discord_commands.BotMissingPermissions):
        await ctx.response.send_message('I don\'t have the required permissions to run this command')
        return

    raise error

client.run(config['BOT_TOKEN'])
