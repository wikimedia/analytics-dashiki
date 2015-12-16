from fabric.api import local, env, sudo, put, task, require
from functools import wraps

import yaml


STAGES = {
    'staging': {
        'hosts': ['dashiki-staging-01.dashiki.eqiad.wmflabs'],
        'branch': 'master',
    },
    'production': {
        'hosts': ['dashiki-01.dashiki.eqiad.wmflabs'],
        'branch': 'master',
    },
}


env.use_ssh_config = True
env.shell = '/bin/bash -c'

CONFIG_FILE = 'config.yaml'
BASE_PATH = '/srv/static'

with open(CONFIG_FILE) as config:
    contents = yaml.load(config)
    DASHBOARDS = contents['config']


def ensure_stage(fn):
    """
    Decorator to ensure the stage is set
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # The require operation will abort if the key stage
        # is not set in the environment
        require('stage', provided_by=(staging, production,))
        return fn(*args, **kwargs)
    return wrapper


def ensure_dashboard(fn):
    """
    Decorator to ensure the stage is set
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # The require operation will abort if the key stage
        # is not set in the environment
        require('dashboard', provided_by=(dashboard))
        return fn(*args, **kwargs)
    return wrapper


def set_dashboard(name, kwargs):
    """
    Inject the dashboard related variables as environment variables
    """
    env.dashboard = name
    dashboard_config = DASHBOARDS[env.dashboard].copy()
    dashboard_config.update(kwargs)
    for option, value in dashboard_config.items():
        setattr(env, option, value)


@ensure_dashboard
def set_stage(stage='staging'):
    """
    Sets the stage and populate the environment with the necessary
    config. Doing this allows accessing from anywhere stage related
    details by simply doing something like env.branch etc, and allows
    to easily add environment variables to stages.
    """
    env.stage = stage
    for option, value in STAGES[env.stage].items():
        setattr(env, option, value)


@task
def dashboard(name, **kwargs):
    set_dashboard(name, kwargs)


@task
def production():
    set_stage('production')


@task
def staging():
    set_stage('staging')


@ensure_dashboard
def get_gulp_command():
    """
    Build the gulp command to run locally based on the report
    config, like 'gulp --layout compare --config Config --piwiki host,1'
    """
    if env.piwikHost and env.piwikId:
        return 'gulp --layout {} --config {} --piwik {},{}'.format(
            env.layout, env.config, env.piwikHost, env.piwikHost, env.piwikId)
    else:
        return 'gulp --layout {} --config {}'.format(
            env.layout, env.config)


@ensure_dashboard
def get_source_path():
    """
    Return the source path where gulp compiles the report
    """
    return 'dist/{}-{}'.format(env.layout, env.config)


@ensure_dashboard
def get_dest_root_path():
    """
    Return the remote destination root where we host shared resources
    """
    return '{}/{}'.format(BASE_PATH.rstrip('/'), env.hostname)


@ensure_dashboard
def get_dest_path():
    """
    Return the remote destination path where the report/dashboard
    is served from
    """
    if env.subfolder:
        return '{}/{}/{}'.format(
            BASE_PATH.rstrip('/'), env.hostname, env.subfolder)
    else:
        return get_dest_root_path()


@task
def setup():
    """
    Setup npm, bower and gulp in local environment,
    only needs to be done once
    """
    local('npm install')
    local('bower install')
    local('npm install -g gulp')


@task
@ensure_stage
def deploy():
    """
    Deploy to remote host by compiling on the local machine,
    and pushing the dashboard to the remote destination directory
    """
    # Compile the report locally using gulp
    local(get_gulp_command())

    # Get the source and destination paths
    root = get_dest_root_path()
    dest = get_dest_path()
    source = get_source_path()

    # Create the destination directory
    sudo('mkdir -p {}'.format(dest))

    # Transfer compiled contents to destination
    put('{}/*'.format(source), dest, use_sudo=True)

    # Also transfer shared resources to the root of the dashboard
    # (This setup may change later)
    put('{}/fonts'.format(source), root, use_sudo=True)


@task
def dashboards():
    """
    List available dashboard names
    """
    print '\n'.join(DASHBOARDS.keys())


@task
def stages():
    """
    List available stages
    """
    print '\n'.join(STAGES.keys())


@task
def config(dashboard_name):
    """
    Print current config for a given dashboard
    """
    try:
        print DASHBOARDS[dashboard_name]
    except KeyError:
        print 'Dashboard {} not configured'.format(dashboard_name)


@task
def help():
    print """
    - Set up your local environment like:

    fab setup

    - To deploy pick a dashboard and a target environment, like:

    fab dashboard:edit-analysis staging deploy
    """
    local('fab -list')
