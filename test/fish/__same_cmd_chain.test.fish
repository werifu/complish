source __is_cmd_chain.fish

function should_succ
    set -l input $argv[1]
    set -l base $argv[2]
    if not __same_cmd_chain $input $base
        set_color red
        echo "Fail (should equal):" \n $input \n $base
        set_color normal
        return 1
    end
    return 0
end

function should_fail
    set -l input $argv[1]
    set -l base $argv[2]
    if __same_cmd_chain $input $base
        set_color red
        echo "Fail (should not equal):" \n $input \n $base
        set_color normal
        return 1
    end
    return 0
end

# $input, $baseline

should_succ "cmd sub1 subsub1 -f file" 'cmd sub1 subsub1'
should_succ "cmd sub1 subsub1 -f" 'cmd sub1 subsub1'
should_succ "cmd sub1 -log debug file" 'cmd sub1'


should_fail "cmd sub1" 'cmd sub2'
should_fail "cmd sub1 subsub1" 'cmd sub1'
